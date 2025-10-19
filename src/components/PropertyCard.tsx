import imgRectangle9 from "figma:asset/df949040391a659376d4f268dc7635ec5dc11c8e.png";

interface PropertyCardProps {
  title: string;
  area: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  pool: string;
  price: string;
  image?: string;
}

export function PropertyCard({
  title,
  area,
  location,
  bedrooms,
  bathrooms,
  pool,
  price,
  image = imgRectangle9
}: PropertyCardProps) {
  return (
    <div className="bg-[#f4f4f4] rounded-[13px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] p-5 w-[252px]">
      <div className="space-y-3">
        <p className="font-['Inter:Black',_sans-serif] font-black leading-[normal] not-italic text-[12px] text-black">
          {title}
        </p>
        
        <div className="h-[104px] w-full">
          <img 
            alt={title}
            className="w-full h-full object-cover"
            src={image}
          />
        </div>

        <div className="space-y-2 text-[10px]">
          <div className="flex justify-between">
            <p className="font-['Inter:Bold',_sans-serif] font-bold">Área</p>
            <p className="font-['Inter:Regular',_sans-serif] font-normal">{area}</p>
          </div>
          
          <div className="flex justify-between">
            <p className="font-['Inter:Regular',_sans-serif] font-normal">Ubicación</p>
            <p className="font-['Inter:Regular',_sans-serif] font-normal text-right">{location}</p>
          </div>
          
          <div className="flex justify-between">
            <p className="font-['Inter:Regular',_sans-serif] font-normal">Habitaciones</p>
            <p className="font-['Inter:Regular',_sans-serif] font-normal">{bedrooms}</p>
          </div>
          
          <div className="flex justify-between">
            <p className="font-['Inter:Regular',_sans-serif] font-normal">Baños</p>
            <p className="font-['Inter:Regular',_sans-serif] font-normal">{bathrooms}</p>
          </div>
          
          <div className="flex justify-between">
            <p className="font-['Inter:Regular',_sans-serif] font-normal">Piscina</p>
            <p className="font-['Inter:Regular',_sans-serif] font-normal">{pool}</p>
          </div>
          
          <div className="flex justify-between items-center pt-2">
            <p className="font-['Inter:Regular',_sans-serif] font-normal">Precio*:</p>
            <p className="font-['Inter:Regular',_sans-serif] font-normal">{price}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
