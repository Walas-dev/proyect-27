export type Celebration = {
    id: string;
    recipient_name: string | null;
    celebration_date: string | null;
};

export type Memory = {
    id: string;
    src:string;
    width: number;
    height: number;
    caption: string;
    author: string | null;
};