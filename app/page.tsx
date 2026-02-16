import TodoApp from "@/components/TodoApp";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="w-full max-w-lg">
        <TodoApp />
      </main>
    </div>
  );
}
