import { useState, useEffect } from 'react';

const WEAPON_TYPES = {
  STANDARD: 0,
  HOMING: 1,
  SPREAD: 2,
  LASER: 3
};

const WEAPON_NAMES = {
  [WEAPON_TYPES.STANDARD]: 'Standard',
  [WEAPON_TYPES.HOMING]: 'Homing Rockets',
  [WEAPON_TYPES.SPREAD]: 'Spread Shot',
  [WEAPON_TYPES.LASER]: 'Laser'
};

const useWeaponSystem = () => {
  const [currentWeapon, setCurrentWeapon] = useState(WEAPON_TYPES.STANDARD);
  const [weaponName, setWeaponName] = useState(WEAPON_NAMES[WEAPON_TYPES.STANDARD]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Tab or Q to cycle weapons
      if (e.key === 'Tab' || e.key === 'q' || e.key === 'Q') {
        e.preventDefault();
        setCurrentWeapon(prev => {
          const weapons = Object.values(WEAPON_TYPES);
          const currentIndex = weapons.indexOf(prev);
          const nextIndex = (currentIndex + 1) % weapons.length;
          const nextWeapon = weapons[nextIndex];
          setWeaponName(WEAPON_NAMES[nextWeapon]);
          console.log('🔫 Weapon switched to:', WEAPON_NAMES[nextWeapon]);
          return nextWeapon;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { currentWeapon, weaponName, WEAPON_TYPES };
};

export default useWeaponSystem;