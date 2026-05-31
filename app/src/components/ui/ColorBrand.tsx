const brandColors = [
  { name: 'Primary (Navy)', hex: '#1B2B5E', tailwind: 'bg-teal-300' },
  { name: 'Surface (Beige)', hex: '#F5F0E8', tailwind: 'bg-teal-100' },
  { name: 'Accent (Purple)', hex: '#C4B5D9', tailwind: 'bg-teal-200' },
];

const colorPalette = [
  { name: 'teal-50', hex: '#FAF7F2' },
  { name: 'teal-100', hex: '#F5F0E8' },
  { name: 'teal-200', hex: '#C4B5D9' },
  { name: 'teal-300', hex: '#1B2B5E' },
  { name: 'teal-400', hex: '#A899C4' },
  { name: 'teal-500', hex: '#6B7BA8' },
  { name: 'teal-600', hex: '#4A5C8F' },
  { name: 'teal-700', hex: '#354878' },
  { name: 'teal-800', hex: '#283A6A' },
  { name: 'teal-900', hex: '#1B2B5E' },
  { name: 'teal-950', hex: '#141F42' },
];

const ColorBrand = () => {
  return (
    <section id="color" className="space-y-10 py-10 md:space-y-16 md:py-20">
      <div>
        <h2 className="mb-6 text-base font-medium">Brand Colors</h2>
        <div className="flex flex-wrap gap-4 md:gap-8">
          {brandColors.map(({ name, hex, tailwind }) => (
            <div key={name} className="flex flex-col items-center">
              <div
                className={`size-24 rounded-b-full border shadow dark:border-light/30 md:size-32 ${tailwind}`}
              ></div>
              <span className="mt-2 text-sm font-semibold">{name}</span>
              <span className="text-xs opacity-70">{hex}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-6 text-base font-medium">Teal Palette</h3>
        <div className="flex flex-wrap gap-3 md:gap-2">
          {colorPalette.map(({ name, hex }) => (
            <div key={name} className="flex flex-col items-center">
              <div
                className={`size-[4.5rem] rounded-b-full shadow md:size-16`}
                style={{ backgroundColor: hex }}
              ></div>
              <span className="mt-1 text-xs font-medium">{name}</span>
              <span className="text-xxs opacity-70">{hex}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-muted-foreground text-xs">
        NOTE: Notice the gentle curve at the bottom of each color—this playful
        shape is inspired by the signature smile in the WorkRide logo, adding a
        friendly touch to our palette and gives tribute to our WorkRide Smiley.
      </p>
    </section>
  );
};

export default ColorBrand;
