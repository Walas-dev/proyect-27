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

export type Letter = {
  id: string;
  title: string | null;
  message: string;
  author: string | null;
  color: string;
  icon: string;
};