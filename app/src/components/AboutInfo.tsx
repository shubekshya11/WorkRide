import { Link } from 'react-router-dom';
// import nepal from '../assets/images/nepal.svg';
import logo from '../assets/logo.svg';
import CareOurEarth from './ui/CareOurEarth';

import { ROUTE_ABOUT } from '../constants/routes';

const AboutInfo = () => {
  return (
    <>
      <section className="relative z-10 h-auto bg-teal-100 bg-[radial-gradient(circle,_#C4B5D9_12%,_transparent_12%),_radial-gradient(circle,_#F5F0E8_12%,_transparent_12%)] bg-[length:20px_20px] bg-[position:0_0,10px_10px] px-0 py-0 xl:h-screen">
        <div className="pointer-events-none absolute inset-0 -z-10 size-full select-none bg-gradient-to-b from-teal-100 via-transparent to-teal-200"></div>
        <div className="flex h-full flex-col justify-between gap-0 sm:gap-16 md:items-center xl:flex-row xl:gap-0">
          {/* <img
            src={nepal}
            className="absolute inset-0 -z-10 size-full scale-75 mix-blend-overlay"
          /> */}
          <div className="order-1 flex size-full max-w-4xl flex-col items-center justify-center gap-4 px-6 pb-12 text-center sm:pb-0 md:order-2">
            <CareOurEarth />

            <h2 className="mt-4 text-2xl font-bold capitalize leading-snug md:text-4xl md:leading-snug lg:text-5xl lg:leading-snug">
              A world where we all share resources to better preserve our
              planet.
            </h2>

            <p className="max-w-2xl font-body text-xs dark:text-shadow-dark sm:text-sm md:text-sm">
              WorkRide is the platform that connects your co-workers sharing the
              same route to work. Share resources, reduce your carbon footprint,
              save money, and step towards a greener planet and sustainable
              future. We are committed to making a positive impact on the
              environment and helping you do the same. Join us in our mission to
              create a more sustainable future for all.
            </p>

            <Link
              to={ROUTE_ABOUT}
              className="transition-150 group mt-4 flex items-center gap-2.5 rounded-full bg-teal-300 px-4 py-3 pr-5 text-sm font-light text-teal-100 shadow-lg hover:bg-teal-800 sm:text-sm md:mt-10"
            >
              <img
                src={logo}
                alt="Logo"
                className="group-hover:filter-white transition-150 size-4 object-contain sm:size-5"
              />
              More About WorkRide
            </Link>
          </div>
          {/* <img
            src={logo}
            className="absolute inset-0 -z-20 size-full scale-75 object-contain opacity-50 drop-shadow"
          /> */}
        </div>
      </section>
    </>
  );
};

export default AboutInfo;
