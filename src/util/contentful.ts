import { createClient } from 'contentful';
import type { CONTENTFUL_HARP } from '../types';

const space = import.meta.env.VITE_CONTENTFUL_SPACE_ID;
const accessToken = import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN;

const client = createClient({
    space: space,
    accessToken: accessToken,
});

export async function fetchContentfulData() {
    try {
        const response = await client.getEntries({
            // content_type: 'crystalHarpModels',
        });
        return parseContentfulData(response.items);
    } catch (error) {
        console.error('Error fetching data from Contentful:', error);
        throw error;
    }
}

export function parseContentfulData(items: any[]) {
    return items.map(item => {
        return {
            id: item.sys.id,
            ...item.fields
            // Add other fields as needed
        } as CONTENTFUL_HARP;
    });
}