/**
 * Public Decorator
 * Marks routes that don't require authentication
 * Usage: @Public() trước route handler
 */

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
