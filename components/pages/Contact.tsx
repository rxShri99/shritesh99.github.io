import { contact } from '@/data/portfolio';
import Parallax from '@/components/Parallax';

const iconPaths: Record<string, string> = {
  github:
    'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z',
  linkedin:
    'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  twitter:
    'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
};

export default function Contact() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-6">
      <div className="max-w-xl w-full text-center space-y-10">
        {/* Heading */}
        <Parallax speed={0.35} className="space-y-3">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Get in Touch
          </h2>
          <p className="text-white/50 text-lg">
            Have a project in mind or just want to say hello?
          </p>
        </Parallax>

        {/* Email */}
        <Parallax speed={0.25}>
          <a
            href={`mailto:${contact.email}`}
            className="inline-block text-xl md:text-2xl font-medium text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-4"
          >
            {contact.email}
          </a>
        </Parallax>

        {/* Social Links */}
        <Parallax speed={0.15} className="flex items-center justify-center gap-6">
          {contact.links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2"
            >
              <span className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-blue-400 group-hover:bg-blue-400/10 transition-all">
                <svg
                  className="w-5 h-5 fill-white/70 group-hover:fill-blue-400 transition-colors"
                  viewBox="0 0 24 24"
                >
                  <path d={iconPaths[link.icon] ?? ''} />
                </svg>
              </span>
              <span className="text-xs text-white/40 group-hover:text-white/70 transition-colors">
                {link.label}
              </span>
            </a>
          ))}
        </Parallax>

        {/* Footer */}
        <Parallax speed={0.05}>
          <p className="text-white/20 text-sm pt-8">
            &copy; {new Date().getFullYear()} Shritesh Jamulkar. All rights
            reserved.
          </p>
        </Parallax>
      </div>
    </div>
  );
}
