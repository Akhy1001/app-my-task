import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user');

    if (!user || (user !== 'anas' && user !== 'rose')) {
        return NextResponse.json({ error: 'User must be "anas" or "rose"' }, { status: 400 });
    }

    try {
        const filePath = path.join(DATA_DIR, `${user}.json`);
        const data = await fs.readFile(filePath, 'utf8');
        return NextResponse.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading todos:', error);
        // Return default structure if file doesn't exist
        return NextResponse.json({ todos: [], settings: {} }, { status: 200 });
    }
}

export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user');

    if (!user || (user !== 'anas' && user !== 'rose')) {
        return NextResponse.json({ error: 'User must be "anas" or "rose"' }, { status: 400 });
    }

    try {
        const body = await request.json(); // Expected: { todos: [], settings: {} }
        const filePath = path.join(DATA_DIR, `${user}.json`);
        await fs.mkdir(DATA_DIR, { recursive: true });
        await fs.writeFile(filePath, JSON.stringify(body, null, 2));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving data:', error);
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
}
