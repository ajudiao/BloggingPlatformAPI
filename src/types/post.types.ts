
export interface CreatePostDTO {
  title: string;
  content: string;
  category: string;
  tags: string[];
}

export interface UpdatePostDTO {
  title: string;
  content: string;
  category: string;
  tags: string[];
}

export type PostSortBy = "createdAt" | "updatedAt" | "title";
export type SortOrder = "asc" | "desc";

export interface FindAllPostsDTO {
  sortBy: PostSortBy;
  order: SortOrder;
  term?: string;
}