/**
 * Índice de esquemas para Sanity Studio.
 */
import { serviceSchema } from './service.js';
import { addonSchema } from './addon.js';
import { categorySchema } from './category.js';
import { localeString, localeText } from './localeTypes.js';

export const schemaTypes = [serviceSchema, addonSchema, categorySchema, localeString, localeText];
