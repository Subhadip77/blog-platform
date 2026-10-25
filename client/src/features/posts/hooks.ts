import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { postsApi, type PostInput } from './api';

export const usePosts = (page: number) =>
  useQuery({
    queryKey: ['posts', 'list', page],
    queryFn: () => postsApi.list(page),
    placeholderData: keepPreviousData, // old page stays visible while the next one loads
  });

export const usePost = (slug: string) =>
  useQuery({ queryKey: ['posts', 'detail', slug], queryFn: () => postsApi.get(slug) });

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (b: PostInput) => postsApi.create(b),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Partial<PostInput>) => postsApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  });
}