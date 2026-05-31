import { useState } from 'react';

const LogoBrand = () => {
  const [toggleLogo, setToggleLogo] = useState(true);
  const [toggleIcon, setToggleIcon] = useState(true);

  return (
    <section id="logo" className="space-y-10 py-10 md:space-y-16 md:py-20">
      <div className="space-y-5 md:space-y-10">
        <p className="text-sm">
          The logo is thoughtfully designed by{' '}
          <a
            href="https://purnashrestha.com.np"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-teal-600 hover:underline"
          >
            Purna Shrestha
          </a>{' '}
          on December 2024. It embodies a modern and minimalist aesthetic,
          reflecting the core values and identity of our brand. Consistent
          application of the logo across all platforms and materials is
          essential to ensure strong and cohesive brand recognition.
        </p>
        <div
          className={`relative flex h-56 w-full items-center justify-center md:h-64 lg:h-96 ${toggleLogo ? 'bg-light' : 'bg-dark'} rounded-b-[2rem] transition-all duration-100`}
        >
          <button
            type="button"
            aria-label="Toggle Logo"
            className={`absolute bottom-3.5 right-3.5 size-11 rounded-full bg-dark ${!toggleLogo ? 'bg-light' : 'bg-dark'}`}
            onClick={() => setToggleLogo((prev) => !prev)}
            aria-pressed={toggleLogo}
          ></button>
          <h1
            className={`text-6xl font-bold md:text-7xl lg:text-8xl ${toggleLogo ? 'text-dark' : 'text-light'}`}
          >
            WorkRide
          </h1>
        </div>
      </div>
      <div className="space-y-10">
        <p className="text-sm">
          WorkRide Smiley is used as the app icon for mobile and desktop
          applications. It is designed to be simple, recognizable, and
          versatile, ensuring that it stands out in various contexts while
          maintaining brand consistency.
        </p>
        <div
          className={`relative flex h-56 w-full items-center justify-center rounded-b-[2rem] bg-[radial-gradient(circle,_#2dd4bf_10%,_transparent_10%),_radial-gradient(circle,_#ffffff00_0%,_transparent_10%)] bg-[length:15px_15px] bg-[position:0_0,10px_10px] px-0 py-0 md:h-64 lg:h-96 ${toggleIcon ? 'bg-light' : 'bg-teal-900'} transition-all duration-100`}
        >
          <button
            type="button"
            aria-label="Toggle Icon"
            className={`absolute bottom-3.5 right-3.5 size-11 rounded-full bg-dark ${!toggleIcon ? 'bg-light' : 'bg-dark'}`}
            onClick={() => setToggleIcon((prev) => !prev)}
            aria-pressed={toggleIcon}
          ></button>
          <h1
            className={`text-4xl font-bold md:text-5xl lg:text-6xl ${toggleIcon ? 'text-dark' : 'text-light'} rounded-3xl p-4 ${toggleIcon ? 'shadow-lg' : 'shadow-none'}`}
          >
            WorkRide
          </h1>
        </div>
      </div>
      <p className="text-muted-foreground text-xs">
        NOTE: Only the two official logo variations shown above—one for light
        backgrounds and one for dark—are permitted for use. No other logo
        versions or color modifications are allowed, ensuring our brand remains
        consistent and recognizable.
      </p>
    </section>
  );
};

export default LogoBrand;
