export type HomeCard={slug:string;title:string;description:string;percentage:number;imageUrl:string;ctaLabel:string;sortOrder:number;isActive:boolean};
export type CarouselItem={id?:string;title:string;subtitle:string;imageUrl:string;sortOrder:number;isActive:boolean};
export type HomeContent={
 hero:{eyebrow:string;title:string;ratingText:string;performancePercent:number;performanceLabel:string;primaryButton:string;secondaryButton:string;imageUrl:string};
 nextMeeting:{label:string;dateTime:string};
 profile:{name:string;avatarUrl:string;planLabel:string};
 navigation:{searchPlaceholder:string;top:string[];sidebar:string[]};
 cards:HomeCard[];carousel:CarouselItem[];carouselIntervalMs:number;
};
