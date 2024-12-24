import {Link} from "@remix-run/react";

const NAV_LINKS = [
    {path: "/digital", label: "Home"},
    {path: "/about-us", label: "About Us"},
    {path: "/projects", label: "Projects"},
    {path: "/contact", label: "Contact"},
];

export const ITEMS = Array.from({ length: 6 }, (_, index) => ({
    id: index + 1,
    image: `Image ${index + 1}`,
    tags: `Tags ${index + 1}`,
    title: `Title ${index + 1}`,
}));

function Header() {
    return (
        <header className="max-w-screen">
            <div className="text-2xl font-bold">LOGO</div>
            <div className="text-center">
                <p className="text-sm">Some multi-line</p>
                <p className="text-sm">text example</p>
            </div>
            <div className="text-sm font-medium bg-white text-black px-4 py-2 rounded cursor-pointer">
                Let’s Talk
            </div>
        </header>
    );
}

function Menu() {
    return (
        <nav>
            <div>menu</div>
            <ul>
                {NAV_LINKS.map((link) => (
                    <li key={link.path}>
                        <Link to={link.path}>{link.label}</Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

function VideoSection({title, children}: { title: string; children?: React.ReactNode }) {
    return (
        <section>
            <div>{title}</div>
            <div>{children}</div>
        </section>
    );
}

function Portfolio({items}: { items: typeof ITEMS }) {
    return (
        <section>
            <div>
                <h2>Title</h2>
                <p>small text</p>
            </div>
            <div>
                {items.map((item) => (
                    <div key={item.id}>
                        <div>{item.image}</div>
                        <div>{item.tags}</div>
                        <div>{item.title}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function Footer() {
    return (
        <footer>
            <div>cajita con cositas, puedes cambiar el background</div>
            <div>
                <div>columna 1</div>
                <div>columna 2</div>
                <div>columna 3</div>
            </div>
        </footer>
    );
}

export default function Digital() {
    return (
        <div className="">
            <Header/>
            <Menu/>
            <VideoSection title="videito"/>
            <VideoSection title="algun titulo">
                <div>
                    <div>cajita con imagen</div>
                    <div>
                        <div>texto</div>
                        <div>call to action</div>
                    </div>
                </div>
            </VideoSection>
            <Portfolio items={ITEMS}/>
            <Footer/>
        </div>
    );
}