import PasswordGate from "./components/PasswordGate";

export default function LandingPage() {
    return (
        <main
            className="flex h-screen w-full flex-col overflow-hidden md:flex-row animate-fade-in"
            style={{
                background:
                    "radial-gradient(ellipse at 35% 50%, hsl(20,6%,12%) 0%, hsl(20,8%,5%) 70%)",
            }}
        >
            {/* left side */}
            <section className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <h1 className="font-serif text-[3rem] font-bold italic tracking-tight text-ash-50 md:text-[4.5rem]">
                    cinder
                </h1>

                <p className="mt-4 font-sans text-[0.9375rem] tracking-wide text-ash-200">
                    a quieter personal cinema
                </p>
            </section>

            {/* right side */}
            <section className="flex flex-1 items-center justify-center px-8">
                <PasswordGate />
            </section>
        </main>
    );
}