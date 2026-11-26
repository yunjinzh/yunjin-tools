"""Conservative neighbourhood heights for OSM buildings lacking vertical attributes."""
import math
import numpy as np
from scipy.spatial import cKDTree


def usage(kind):
    if kind in {'house','detached','bungalow','semidetached_house','terrace'}:return 'small-housing'
    if kind in {'apartments','residential','dormitory'}:return 'housing'
    if kind in {'retail','commercial','office','hotel'}:return 'commercial'
    if kind in {'shed','garage','garages','carport'}:return 'outbuilding'
    return kind


def neighborhood_heights(observations):
    """Each observation is (lon, lat, area in deg², kind, OSM height, OSM levels)."""
    coordinates=np.array([[x*85500,y*111000] for x,y,*_ in observations])
    areas=np.array([max(row[2],1e-16) for row in observations])
    kinds=np.array([usage(row[3]) for row in observations])
    heights=np.array([row[4] or row[5]*3 for row in observations])
    has_measured=np.array([bool(row[4]) for row in observations]);known=np.flatnonzero(heights>0)
    distances,indices=cKDTree(coordinates[known]).query(coordinates,k=80,distance_upper_bound=155)
    blocks=np.floor(coordinates/65);estimates={};differences=[];tagged_diff=[]
    for i in range(len(observations)):
        within=indices[i]<len(known);candidates=known[indices[i,within]];d=distances[i,within]
        similar=(d>1)&(kinds[candidates]==kinds[i])&(np.abs(np.log(areas[candidates]/areas[i]))<.55)
        if heights[i]>0:
            # Remove all references in the held-out building's 65 m cell during testing.
            similar &= np.any(blocks[candidates]!=blocks[i],axis=1)
        candidates=candidates[similar][:7]
        if len(candidates)<3:continue
        samples=heights[candidates];q1,median,q3=np.percentile(samples,[25,50,75]);deviation=np.abs(samples-median)
        if q3-q1>max(3,median*.25) or median>135 or np.count_nonzero(deviation<=max(3,median*.18))<3:continue
        if heights[i]>0:
            error=abs(heights[i]-median);differences.append(error)
            if has_measured[i]:tagged_diff.append(error)
        else:estimates[i]=round(float(median),2)
    def summarize(errors):
        return {'count':len(errors),'meanAbsoluteDifferenceMeters':round(float(np.mean(errors)),2) if errors else None}
    method={'radiusMeters':155,'minimumReferenceBuildings':3,'maximumReferenceBuildings':7,'heightByLevelsMeters':3,'areaLogRatioLimit':.55,'calculation':'Median of similar-area, like-use OSM neighbours with consistent vertical tags in the same map snapshot. Excludes unstable local groups. Not a measured height.','blockValidationMeters':65,'validationOsmHeightAndLevels':summarize(differences),'validationOsmHeightOnly':summarize(tagged_diff)}
    return estimates,method
