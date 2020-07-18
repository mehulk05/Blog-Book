export class UPost {
    title: string;
    desc: string;
    created_date?: Date;

    imgurl: string;
    category: string;
    subcategory?: string;
    name: string;
    privacy: string;
    likecount?: number
    uid: string
    uname: string
    comment?: string

}


export class LikeUser {
    count: number
    uid?: {
        islike: boolean,
        uid: any
    }
}

export class LikeUserDetail {
    uid: {
        islike: boolean,
        uid: any
    }
}


export class Comments {
    comment: string;
    comment_date: Date;
    uid: string;
    uname?: string;
    name?: string
}