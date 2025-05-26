import React from 'react';

const WeaponDisplay = ({ weaponName }) => {
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-lg font-bold">
      <div className="bg-black bg-opacity-50 px-4 py-2 rounded">
        Weapon: {weaponName}
      </div>
      <div className="text-xs text-center mt-1 opacity-75">
        Press Q or Tab to switch
      </div>
    </div>
  );
};

export default WeaponDisplay;