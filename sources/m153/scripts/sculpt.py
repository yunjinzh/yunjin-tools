"""Bake our original atelier mannequin. Authoring only: numpy, scipy, scikit-image, fast-simplification."""
import base64
import json
from pathlib import Path

import fast_simplification
import numpy as np
from scipy.interpolate import PchipInterpolator
from skimage.measure import marching_cubes

root = Path(__file__).resolve().parents[1]
bones = []
parts = []
def bone(name, pivot, end):
    bones.append(dict(name=name, pivot=pivot, end=end))
    return len(bones)-1

def add(b, f):
    parts.append((b, f))

def loft(rows, side=False):
    # Each section controls width, depth and the forward offset of its centre.
    rows=np.asarray(rows)
    fn=PchipInterpolator(rows[:,0],rows[:,1:], axis=0)
    def field(x,y,z):
        low,high=rows[0,0],rows[-1,0]
        rw,rd,cz=fn(np.clip(y,low,high)).T
        r=(np.sqrt((x/rw)**2+((z-cz)/rd)**2)-1)*np.minimum(rw,rd)
        end=np.maximum(low-y,y-high)
        return np.minimum(np.maximum(r,end),0)+np.hypot(np.maximum(r,0),np.maximum(end,0))
    return field

def ellipsoid(center, radius, pitch=0):
    def f(x,y,z):
        dx=x-center[0]; dy=y-center[1]; dz=z-center[2]
        yy=dy*np.cos(pitch)+dz*np.sin(pitch); zz=-dy*np.sin(pitch)+dz*np.cos(pitch)
        return (np.sqrt((dx/radius[0])**2+(yy/radius[1])**2+(zz/radius[2])**2)-1)*min(radius)
    return f

def smooth(a,b,k):
    h=np.maximum(k-abs(a-b),0)/k
    return np.minimum(a,b)-h*h*k*.25

def limb(start,end,sections):
    a=np.array(start); b=np.array(end); axis=b-a
    length=np.linalg.norm(axis); axis/=length
    side=np.array([1.,0,0]); side-=axis*np.dot(side,axis);side/=np.linalg.norm(side)
    forward=np.cross(side,axis)
    if forward[2]<0:forward=-forward
    profile=loft([(t*length,rx,rz,shift) for t,rx,rz,shift in sections])
    def field(x,y,z):
        v=(x-a[0],y-a[1],z-a[2])
        project=lambda n:sum(k*p for k,p in zip(n,v))
        return profile(project(side),project(axis),project(forward))
    return field

pelvis=bone('pelvis',[0,.92,0],[0,1.105,0])
chest=bone('chest',[0,1.105,0],[0,1.44,0])
neck=bone('neck',[0,1.44,0],[0,1.59,.005])
head=bone('head',[0,1.59,.005],[0,1.79,.012])
trunk=loft([(.785,.037,.057,.009),(.817,.095,.079,.004),(.86,.149,.109,-.014),(.925,.176,.120,-.018),(.97,.169,.114,-.01),(1.036,.145,.095,.001),(1.10,.126,.085,.006),(1.145,.126,.085,.006),(1.21,.143,.094,.008),(1.27,.159,.101,.009),(1.325,.166,.103,.004),(1.378,.162,.096,0),(1.419,.156,.082,-.005),(1.444,.142,.071,-.007),(1.469,.091,.057,-.005),(1.486,.050,.047,0)])
add(pelvis,lambda x,y,z:np.maximum(trunk(x,y,z),y-1.113))
add(chest,lambda x,y,z:np.maximum(trunk(x,y,z),1.109-y))
for s in (-1,1):
    add(chest,ellipsoid([s*.074,1.328,.064],[.091,.075,.063],-.19))
add(neck,loft([(1.44,.058,.054,-.008),(1.49,.046,.050,-.004),(1.54,.043,.047,0),(1.59,.046,.049,.002),(1.61,.05,.053,.006)]))
# Jaw narrows forward into a chin. The back of the cranium remains full in profile.
add(head,loft([(1.525,.006,.009,.052),(1.536,.037,.037,.043),(1.564,.057,.062,.033),(1.605,.073,.084,.016),(1.646,.086,.097,.007),(1.694,.091,.101,.001),(1.733,.084,.093,-.002),(1.763,.066,.076,-.005),(1.785,.036,.043,-.007),(1.794,.004,.005,-.006)]))
for s,prefix in [(1,'l'),(-1,'r')]:
    shoulder=[s*.174,1.42,-.002];elbow=[s*.30,1.165,-.012];wrist=[s*.39,.955,.020]
    handend=[s*.433,.838,.05];hip=[s*.096,.905,-.005];knee=[s*.110,.485,.012];ankle=[s*.116,.088,-.009]
    upper=bone(prefix+'Upper',shoulder,elbow);fore=bone(prefix+'Fore',elbow,wrist)
    hand=bone(prefix+'Hand',wrist,handend);thigh=bone(prefix+'Thigh',hip,knee);shin=bone(prefix+'Shin',knee,ankle)
    foot=bone(prefix+'Foot',ankle,[s*.119,.037,.169])
    add(upper,limb(shoulder,elbow,[(-.16,.019,.02,0),(-.09,.054,.053,0),(.12,.066,.068,0),(.32,.054,.056,.001),(.54,.044,.05,.004),(.76,.038,.042,.002),(.96,.036,.038,-.003),(1.08,.024,.028,-.002)]))
    add(fore,limb(elbow,wrist,[(-.10,.019,.023,0),(-.02,.033,.039,-.004),(.15,.042,.044,-.004),(.31,.043,.044,0),(.59,.033,.036,.001),(.85,.024,.028,0),(1.04,.022,.023,0)]))
    add(thigh,limb(hip,knee,[(-.18,.039,.052,0),(-.09,.075,.083,-.009),(.08,.092,.105,-.009),(.24,.087,.097,0),(.48,.075,.082,.005),(.74,.058,.066,.008),(.93,.051,.055,.006),(1.04,.048,.052,.002),(1.10,.027,.032,0)]))
    add(shin,limb(knee,ankle,[(-.09,.028,.036,0),(.01,.046,.050,.002),(.12,.046,.049,-.003),(.30,.055,.064,-.015),(.43,.054,.064,-.018),(.59,.044,.049,-.013),(.81,.028,.031,-.005),(.96,.026,.029,0),(1.055,.020,.022,0)]))
    add(foot,ellipsoid([s*.116,.067,-.009],[.035,.058,.045]))
    add(foot,ellipsoid([s*.116,.054,.049],[.039,.042,.087],-.20))
    add(foot,ellipsoid([s*.121,.033,.124],[.044,.025,.068]))
    palm=limb(wrist,handend,[(-.10,.020,.019,0),(.11,.023,.020,0),(.34,.032,.019,0),(.55,.032,.017,.001),(.63,.026,.014,.002)])
    add(hand,palm)
    # The four fingers follow the observed palm; the thumb sits forward and medially.
    axis=np.array(handend)-wrist;axis=axis/np.linalg.norm(axis)
    cross=np.array([s*axis[1]*-1,s*axis[0],0]);cross/=np.linalg.norm(cross)
    start=np.array(wrist)+axis*.068
    for j,(offset,length) in enumerate([(-.023,.067),(-.008,.075),(.008,.069),(.023,.054)]):
        a=start+cross*offset; b=a+axis*length+cross*(offset*.15)+[0,0,.009]
        r=.008 if j<3 else .0068
        add(hand,limb(a,b,[(-.11,r*.65,r*.65,0),(.05,r,r,0),(.45,r*.92,r*.93,0),(.84,r*.78,r*.78,.002),(1,r*.5,r*.52,.004),(1.04,.002,.002,.004)]))
    a=np.array(wrist)+axis*.026-cross*.020+[0,0,.003]
    b=a+axis*.057-cross*.029+[0,0,.022]
    add(hand,limb(a,b,[(-.1,.012,.012,0),(.2,.012,.012,0),(.63,.009,.010,0),(.94,.007,.008,0),(1.03,.003,.003,0)]))

def fields(points, influence=False):
    x,y,z=points.T
    all_bones=np.full((len(points),len(bones)),10.,dtype='float32')
    for j,f in parts:
        dist=f(x,y,z)
        all_bones[:,j]=smooth(all_bones[:,j],dist,.052 if j==chest else .021 if 'Hand' not in bones[j]['name'] else .005)
    if influence:return all_bones
    value=all_bones[:,0]
    for j in range(1,len(bones)):
        value=smooth(value,all_bones[:,j],.023 if 'Hand' not in bones[j]['name'] else .010)
    return value

def bake():
    # 5 mm samples preserve the separation of the digits.
    step=.005
    axes=[np.arange(a,b,step,dtype='float32') for a,b in [(-.49,.495),(-.01,1.82),(-.176,.216)]]
    volume=np.empty(tuple(map(len,axes)),dtype='float32')
    for i in range(0,len(axes[0]),3):
        strip=axes[0][i:i+3]; coords=np.stack(np.meshgrid(strip,*axes[1:],indexing='ij'),axis=-1)
        volume[i:i+len(strip)]=fields(coords.reshape(-1,3)).reshape(coords.shape[:-1])
    vs,fs,_,_=marching_cubes(volume,0,spacing=(step,)*3,allow_degenerate=False)
    vs+=np.array([a[0] for a in axes])
    vs,fs=fast_simplification.simplify(vs,fs,target_count=27500,agg=5)
    fs=np.ascontiguousarray(fs[:,::-1])
    # Orient each closed mesh outwards by its signed volume.
    if np.einsum('ij,ij->i',vs[fs[:,0]],np.cross(vs[fs[:,1]],vs[fs[:,2]])).sum()<0:
        fs=np.ascontiguousarray(fs[:,::-1])
    field=fields(vs,True); ids=field.argsort(axis=1)[:,:3]
    ds=np.take_along_axis(field,ids,axis=1)
    weights=np.exp(-(ds-ds[:,:1])/.018);weights/=weights.sum(1)[:,None]
    # Subtle material changes at sleeve hems, wrists, knees and around the waist.
    tone=np.ones(len(vs))
    for j,meta in enumerate(bones):
        name=meta['name'];weight=np.sum(weights*(ids==j),axis=1)
        start=np.array(meta['pivot']);axis=np.array(meta['end'])-start
        t=(vs-start)@axis/(axis@axis)
        cuts=[]
        if name.endswith('Upper'): cuts=[(.33,.021,.085)]
        if name.endswith('Fore'): cuts=[(.98,.012,.16)]
        if name.endswith('Thigh'):cuts=[(.29,.014,.045),(.94,.014,.07)]
        if name.endswith('Shin'):cuts=[(.055,.018,.07)]
        for center,sigma,amount in cuts:tone-=weight*amount*np.exp(-.5*((t-center)/sigma)**2)
    tone-=.060*np.exp(-.5*((vs[:,1]-1.213)/.005)**2)*(np.abs(vs[:,0])<.159)
    # Differentiate the original sculpt so large, simplified triangles retain smooth highlights.
    eye=np.eye(3)*.004
    normal=np.stack([fields(vs+e)-fields(vs-e) for e in eye],axis=1)
    normal/=np.maximum(np.linalg.norm(normal,axis=1,keepdims=True),1.e-8)
    ao=np.zeros(len(vs))
    for radius,weight in [(.022,.32),(.05,.29),(.10,.19)]:
        ao+=weight*np.clip(1-fields(vs+normal*radius)/radius,0,1)
    tone*=1-.23*ao
    target=root/'dist'/'mannequin-data.mjs'
    encode=lambda a:base64.b64encode(a.tobytes()).decode()
    arrays={'vertices':(vs*10000).round().astype('<i2'),'triangles':fs.astype('<u2'),'bones':ids.astype('u1'),'weights':(weights*255).round().astype('u1'),'normal':(normal*127).round().astype('i1'),'tone':(tone*255).round().astype('u1')}
    with target.open('w') as out:
        out.write('// Generated by scripts/sculpt.py. Dimensions in metres.\n')
        out.write('export const skeleton='+json.dumps(bones,separators=(',',':'))+';\n')
        for key,array in arrays.items():out.write(f"export const {key}='{encode(array)}';\n")
    print(len(vs),len(fs),target.stat().st_size,flush=True)

if __name__=='__main__':bake()
