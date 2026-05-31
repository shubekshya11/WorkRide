import { Link } from 'react-router-dom';

import { footerLinks } from '../constants/data';
import { getCurrentYear } from '../utils/functions';
// import { PWAInstallButton } from '../components/ui/PWAInstallButton';

const Footer = () => {
  return (
    <>
      <footer className="z-20 flex flex-col justify-between gap-8 bg-teal-900 py-16 text-base text-teal-100 hover:!bg-teal-900 md:text-lg lg:flex-row lg:items-center lg:gap-10">
        {/* <div className="absolute inset-0 h-px w-full bg-gradient-to-r from-transparent from-15% via-white/80 to-transparent to-85%"></div> */}
        <div className="space-y-10">
          <div className="space-y-4">
            <p className="max-w-2xl text-xs">
              WorkRide is a web-based platform that connects your co-workers
              sharing the same route to work and share resources, reduce your
              carbon footprint, save money and step towards a greener planet and
              sustainable future.
            </p>
          </div>
          {/* <PWAInstallButton /> */}
        </div>

        <div className="flex flex-col items-start gap-4 lg:items-end">
          <div className="max-w-xl space-y-3 text-left lg:text-right">
            <p className="text-base">
              © WorkRide {getCurrentYear()} | All rights reserved |
            </p>
            <p className="text-xs font-extralight">
              All logos, trademarks, and contents used in this website are for
              identification purposes only. Any unauthorized use, reproduction
              or distribution of the content of this website is subject to legal
              action.
            </p>
            <ul className="policies flex flex-wrap gap-8 gap-x-6 gap-y-0 lg:justify-end">
              {footerLinks.map((links, index) => (
                <li key={index}>
                  <Link
                    className="text-xs underline hover:no-underline"
                    to={links.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {links.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* <p className="text-sm">
            Developed by:{' '}
            <a
              href="https://www.purnashrestha.com.np"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base hover:underline"
            >
              Purna Shrestha
            </a>
          </p> */}
        </div>
      </footer>
    </>
  );
};

export default Footer;
