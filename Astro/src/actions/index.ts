import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { user } from '@/actions/user';

export const server = {
  user,
}