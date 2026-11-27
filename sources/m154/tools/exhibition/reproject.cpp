// Two-view, depth-tested image based rendering. Blender Cycles perspective Z
// stores camera-space axial depth (intern/cycles/kernel/camera/camera.h).
#include <algorithm>
#include <cmath>
#include <cstdint>
#include <vector>

namespace {
constexpr float skyZ=1e7f;
constexpr float unseen=1e20f;
struct Projection {
    const float* m;  // Three rows; source-camera axes and translation in the destination frame.
    void ray(float u,float v,float& x,float& y,float& z) const {
        x=m[0]*u+m[1]*v+m[2]; y=m[4]*u+m[5]*v+m[6]; z=m[8]*u+m[9]*v+m[10];
    }
    void point(float u,float v,float depth,float& x,float& y,float& z) const {
        ray(u,v,x,y,z);
        if(depth>=skyZ){x*=skyZ;y*=skyZ;z*=skyZ;}
        else{x=x*depth+m[3];y=y*depth+m[7];z=z*depth+m[11];}
    }
};
struct Source {
    const uint8_t* rgb; const float* depth; const int w,h; const float focal;
    Projection toTarget,fromTarget;
};
struct Sample {
    float color[3]{},weight=0,quality=0;
};
inline bool finiteDepth(float d){return d>0.f&&std::isfinite(d);}
void splatDepth(const Source& s,int W,int H,float f,std::vector<float>& zbuf){
    const float radius=std::max(.52f,.51f*W/s.w);
    for(int y=0;y<s.h;y++){
        const float v=(y+.5f-s.h*.5f)/s.focal;
        for(int x=0;x<s.w;x++){
            const float d=s.depth[y*s.w+x];if(!finiteDepth(d)||d>=skyZ)continue;
            float X,Y,Z;s.toTarget.point((x+.5f-s.w*.5f)/s.focal,v,d,X,Y,Z);
            if(Z<=.05f)continue;
            const float u=f*X/Z+W*.5f-.5f,vv=f*Y/Z+H*.5f-.5f;
            if(u<-radius||vv<-radius||u>=W+radius||vv>=H+radius)continue;
            const int l=std::max(0,(int)std::ceil(u-radius)),r=std::min(W-1,(int)std::floor(u+radius));
            const int t=std::max(0,(int)std::ceil(vv-radius)),b=std::min(H-1,(int)std::floor(vv+radius));
            for(int yy=t;yy<=b;yy++)for(int xx=l;xx<=r;xx++){
                float& target=zbuf[yy*W+xx];target=std::min(target,Z);
            }
        }
    }
}
// A reprojection candidate must agree with the source Z even for samples
// immediately across the edge of a thin foreground object.
Sample sample(const Source& s,float u,float v,float d){
    float X,Y,Z;s.fromTarget.point(u,v,d,X,Y,Z);Sample out;if(Z<=.05f)return out;
    const float x=s.focal*X/Z+s.w*.5f-.5f,y=s.focal*Y/Z+s.h*.5f-.5f;
    if(x<-.51f||x>s.w-.49f||y<-.51f||y>s.h-.49f)return out;
    const float U=std::clamp(x,0.f,(float)s.w-1),V=std::clamp(y,0.f,(float)s.h-1);
    const int x0=(int)U,y0=(int)V,x1=std::min(x0+1,s.w-1),y1=std::min(y0+1,s.h-1);
    const int offsets[]={y0*s.w+x0,y0*s.w+x1,y1*s.w+x0,y1*s.w+x1};
    const float fx=U-x0,fy=V-y0,weights[]={(1-fx)*(1-fy),fx*(1-fy),(1-fx)*fy,fx*fy};
    const bool sky=d>=skyZ;
    // Sloping, distant ground may have a steep depth derivative. Increase the
    // tolerance only for depth samples already on the same side of a silhouette.
    const float tol=std::max(.13f,.025f*Z);
    for(int i=0;i<4;i++){
        const int j=offsets[i];const float observed=s.depth[j];if(!finiteDepth(observed))continue;
        const float err=std::abs(observed-Z);
        if(sky?observed<skyZ:err>tol)continue;
        const float k=weights[i];out.weight+=k;
        out.quality+=k*(sky?1.f:1.f-.55f*err/tol);
        for(int c=0;c<3;c++)out.color[c]+=k*s.rgb[3*j+c];
    }
    if(out.weight>.00001f)for(float& n:out.color)n/=out.weight;
    return out;
}
void nearestVisible(int W,int H,std::vector<uint8_t>& good,const std::vector<float>& z,uint8_t* rgb){
    // Only cracks that neither endpoint observed reach this pass. Pull colour
    // from the farther silhouette side. Never interpolate foreground colour
    // across a newly exposed background strip.
    std::vector<int> nearest(W*H,-1),cost(W*H,1<<27);
    for(int i=0;i<W*H;i++)if(good[i]){nearest[i]=i;cost[i]=0;}
    auto offer=[&](int i,int from){
        if(nearest[from]<0||good[i])return;
        const int old=nearest[i],fresh=nearest[from],step=cost[from]+1;
        if(step<cost[i]||(step==cost[i]&&old>=0&&z[fresh]>z[old])){
            nearest[i]=fresh;cost[i]=step;
        }
    };
    for(int y=0;y<H;y++)for(int x=0;x<W;x++){const int i=y*W+x;if(x)offer(i,i-1);if(y)offer(i,i-W);}
    for(int y=H-1;y>=0;y--)for(int x=W-1;x>=0;x--){const int i=y*W+x;if(x+1<W)offer(i,i+1);if(y+1<H)offer(i,i+W);}
    for(int i=0;i<W*H;i++)if(!good[i]&&nearest[i]>=0)for(int c=0;c<3;c++)rgb[i*3+c]=rgb[nearest[i]*3+c];
}
}

extern "C" int render_pair(const uint8_t* a,const float* za,const uint8_t* b,const float* zb,
                           int w,int h,int W,int H,float sf,float tf,
                           const float* pose,float t,uint8_t* rgb){
    const Source sources[]={{a,za,w,h,sf,{pose},{pose+12}},{b,zb,w,h,sf,{pose+24},{pose+36}}};
    std::vector<float> depth(W*H,unseen);std::vector<uint8_t> good(W*H,0);
    for(const auto& s:sources)splatDepth(s,W,H,tf,depth);
    int misses=0;
    for(int y=0;y<H;y++){
        const float v=(y+.5f-H*.5f)/tf;
        for(int x=0;x<W;x++){
            const int i=y*W+x;const float u=(x+.5f-W*.5f)/tf;
            float d=depth[i];Sample A=sample(sources[0],u,v,d),B=sample(sources[1],u,v,d);
            if(A.weight+B.weight<.01f){
                // Find the far side of a subpixel source hole and test the
                // reprojected samples again before allowing spatial inpainting.
                float candidate=0;
                for(int j=-2;j<=2;j++)for(int k=-2;k<=2;k++){
                    int xx=x+k,yy=y+j;if(xx<0||xx>=W||yy<0||yy>=H)continue;
                    const float z=depth[yy*W+xx];if(z<unseen&&std::abs(z-d)>.01f)candidate=std::max(candidate,z);
                }
                if(candidate>0){A=sample(sources[0],u,v,candidate);B=sample(sources[1],u,v,candidate);}
                if(A.weight+B.weight<.01f&&d<skyZ){A=sample(sources[0],u,v,skyZ);B=sample(sources[1],u,v,skyZ);}
            }
            if(A.weight+B.weight<.01f){misses++;continue;}
            float wa=A.quality*(1-t),wb=B.quality*t;
            if(wa+wb<1e-6f){wa=A.quality;wb=B.quality;}
            for(int c=0;c<3;c++)rgb[3*i+c]=(uint8_t)std::clamp((wa*A.color[c]+wb*B.color[c])/(wa+wb)+.5f,0.f,255.f);
            good[i]=1;
        }
    }
    if(misses&&misses<W*H)nearestVisible(W,H,good,depth,rgb);
    return misses;
}
