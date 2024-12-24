import React from 'react';

const LusionClone = () => {
    return (
        <div className="font-sans">
            {/* Navigation */}
            <header className="fixed top-0 w-full p-4 bg-black/80 text-white flex justify-between items-center z-10">
                <h1 className="text-xl font-bold">Lusion Clone</h1>
                <nav>
                    <ul className="flex space-x-4">
                        <li><a href="#about" className="text-white hover:underline">About</a></li>
                        <li><a href="#projects" className="text-white hover:underline">Projects</a></li>
                        <li><a href="#contact" className="text-white hover:underline">Contact</a></li>
                    </ul>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="h-screen flex justify-center items-center text-center bg-gradient-to-br from-purple-700 to-black text-white">
                <div>
                    <h1 className="text-6xl mb-4">Discover Creativity</h1>
                    <p className="text-lg mb-6">A digital experience like no other.</p>
                    <button className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-gray-200">
                        Explore Now
                    </button>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-20 px-6 bg-gray-900 text-white text-center">
                <h2 className="text-4xl mb-6">About Us</h2>
                <p className="text-lg max-w-2xl mx-auto">
                    We craft visually stunning and interactive digital experiences. Our work is powered by innovation and driven by creativity.
                </p>
            </section>

            {/* Projects Section */}
            <section id="projects" className="py-20 px-6 bg-black text-white text-center">
                <h2 className="text-4xl mb-6">Our Projects</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    <div className="p-6 bg-gray-800 rounded-lg">
                        <h3 className="text-2xl mb-2">Project One</h3>
                        <p className="text-lg">A groundbreaking digital experience.</p>
                    </div>
                    <div className="p-6 bg-gray-800 rounded-lg">
                        <h3 className="text-2xl mb-2">Project Two</h3>
                        <p className="text-lg">Innovating the future of design.</p>
                    </div>
                    <div className="p-6 bg-gray-800 rounded-lg">
                        <h3 className="text-2xl mb-2">Project Three</h3>
                        <p className="text-lg">Transforming ideas into reality.</p>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20 px-6 bg-gray-900 text-white text-center">
                <h2 className="text-4xl mb-6">Contact Us</h2>
                <p className="text-lg mb-6">Let's work together on your next big idea.</p>
                <button className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-gray-200">
                    Get in Touch
                </button>
            </section>

            {/* Footer */}
            <footer className="py-6 bg-black text-white text-center">
                <p>&copy; 2024 Lusion Clone. All Rights Reserved.</p>
            </footer>
        </div>
    );
};

export default LusionClone;
