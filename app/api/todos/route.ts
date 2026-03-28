import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user');

    if (!user || (user !== 'anas' && user !== 'rose')) {
        return NextResponse.json({ error: 'User must be "anas" or "rose"' }, { status: 400 });
    }

    try {
        const { data: todosData, error: todosError } = await supabase
            .from('todos')
            .select('*')
            .eq('user_id', user);

        const { data: settingsData, error: settingsError } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', user)
            .maybeSingle();

        if (todosError) throw todosError;
        if (settingsError) throw settingsError;

        const todos = todosData || [];
        const settings = settingsData ? {
            theme: settingsData.theme,
            sortOption: settingsData.sort_option
        } : {};

        return NextResponse.json({ todos, settings });
    } catch (error) {
        console.error('Error reading from Supabase:', error);
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
        const body = await request.json();
        
        if (body.settings) {
            const { error: settingsError } = await supabase
                .from('user_settings')
                .upsert({ 
                    user_id: user, 
                    theme: body.settings.theme || 'light', 
                    sort_option: body.settings.sortOption || 'default'
                });
            if (settingsError) throw settingsError;
        }

        if (body.todos) {
            // Remove previous todos to do a full sync
            const { error: deleteError } = await supabase
                .from('todos')
                .delete()
                .eq('user_id', user);
            if (deleteError) throw deleteError;

            if (body.todos.length > 0) {
                const todosToInsert = body.todos.map((todo: any) => ({
                    id: todo.id,
                    user_id: user,
                    text: todo.text,
                    completed: todo.completed,
                    date: todo.date || null,
                    priority: todo.priority || null,
                    horizon: todo.horizon || 'short',
                    comments: todo.comments || []
                }));
                const { error: insertError } = await supabase
                    .from('todos')
                    .insert(todosToInsert);
                if (insertError) throw insertError;
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving data to Supabase:', error);
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
}
