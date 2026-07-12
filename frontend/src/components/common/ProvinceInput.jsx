import React, { useState, useEffect, useRef } from 'react';

const FALLBACK_PROVINCES = [
  { name: 'Thành phố Hà Nội', code: 1 },
  { name: 'Tỉnh Cao Bằng', code: 4 },
  { name: 'Tỉnh Tuyên Quang', code: 8 },
  { name: 'Tỉnh Điện Biên', code: 11 },
  { name: 'Tỉnh Lai Châu', code: 12 },
  { name: 'Tỉnh Sơn La', code: 14 },
  { name: 'Tỉnh Lào Cai', code: 15 },
  { name: 'Tỉnh Thái Nguyên', code: 19 },
  { name: 'Tỉnh Lạng Sơn', code: 20 },
  { name: 'Tỉnh Quảng Ninh', code: 22 },
  { name: 'Tỉnh Bắc Ninh', code: 24 },
  { name: 'Tỉnh Phú Thọ', code: 25 },
  { name: 'Thành phố Hải Phòng', code: 31 },
  { name: 'Tỉnh Hưng Yên', code: 33 },
  { name: 'Tỉnh Ninh Bình', code: 37 },
  { name: 'Tỉnh Thanh Hóa', code: 38 },
  { name: 'Tỉnh Nghệ An', code: 40 },
  { name: 'Tỉnh Hà Tĩnh', code: 42 },
  { name: 'Tỉnh Quảng Trị', code: 44 },
  { name: 'Thành phố Huế', code: 46 },
  { name: 'Thành phố Đà Nẵng', code: 48 },
  { name: 'Tỉnh Quảng Ngãi', code: 51 },
  { name: 'Tỉnh Gia Lai', code: 52 },
  { name: 'Tỉnh Khánh Hòa', code: 56 },
  { name: 'Tỉnh Đắk Lắk', code: 66 },
  { name: 'Tỉnh Lâm Đồng', code: 68 },
  { name: 'Tỉnh Đồng Nai', code: 75 },
  { name: 'Thành phố Hồ Chí Minh', code: 79 },
  { name: 'Tỉnh Tây Ninh', code: 80 },
  { name: 'Tỉnh Đồng Tháp', code: 82 },
  { name: 'Tỉnh Vĩnh Long', code: 86 },
  { name: 'Tỉnh An Giang', code: 91 },
  { name: 'Thành phố Cần Thơ', code: 92 },
  { name: 'Tỉnh Cà Mau', code: 96 }
];

const removeDiacritics = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

const matchesSearch = (provinceName, searchValue) => {
  const normProvince = removeDiacritics(provinceName).toLowerCase();
  const normSearch = removeDiacritics(searchValue).toLowerCase();
  
  const cleanProvince = normProvince
    .replace(/^tinh\s+/, '')
    .replace(/^thanh\s+pho\s+/, '');
    
  return normProvince.includes(normSearch) || cleanProvince.includes(normSearch);
};

export default function ProvinceInput({ label, name, value, onChange, placeholder = 'Nhập quê quán / tỉnh thành...', required, error, disabled }) {
  const [provinces, setProvinces] = useState(FALLBACK_PROVINCES);
  const [filteredProvinces, setFilteredProvinces] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const wrapperRef = useRef(null);

  // Fetch provinces from API on mount
  useEffect(() => {
    async function fetchProvinces() {
      try {
        const response = await fetch('https://provinces.open-api.vn/api/v2/p/');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            // Map the API results to the expected format
            const mappedData = data.map(item => ({
              name: item.name,
              code: item.code
            }));
            setProvinces(mappedData);
          }
        }
      } catch (err) {
        console.warn('Không thể kết nối đến API tỉnh thành, đang sử dụng fallback offline:', err);
      }
    }
    fetchProvinces();
  }, []);

  // Filter provinces based on input value
  useEffect(() => {
    if (!value) {
      setFilteredProvinces(provinces);
    } else {
      const filtered = provinces.filter(prov => matchesSearch(prov.name, value));
      setFilteredProvinces(filtered);
    }
    setFocusedIndex(-1);
  }, [value, provinces]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    onChange(e);
    setIsOpen(true);
  };

  const handleSelectProvince = (provinceName) => {
    onChange({ target: { name, value: provinceName } });
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          filteredProvinces.length > 0 ? (prev + 1) % filteredProvinces.length : -1
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          filteredProvinces.length > 0 ? (prev - 1 + filteredProvinces.length) % filteredProvinces.length : -1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredProvinces.length) {
          handleSelectProvince(filteredProvinces[focusedIndex].name);
        } else if (filteredProvinces.length > 0) {
          // If no index is focused, but there's a matching list, choose the first one
          handleSelectProvince(filteredProvinces[0].name);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className="form-group" ref={wrapperRef} style={{ position: 'relative' }}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span style={{ color: 'var(--danger)' }}> *</span>}
        </label>
      )}
      
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          name={name}
          value={value ?? ''}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="form-control"
          autoComplete="off"
        />
        
        {isOpen && filteredProvinces.length > 0 && !disabled && (
          <div className="province-dropdown">
            {filteredProvinces.map((prov, index) => (
              <div
                key={prov.code || index}
                onClick={() => handleSelectProvince(prov.name)}
                className={`province-dropdown-item ${focusedIndex === index ? 'focused' : ''}`}
                style={{
                  padding: '10px 14px',
                  cursor: 'pointer',
                  fontSize: 'var(--fs-base)',
                  backgroundColor: focusedIndex === index ? 'var(--primary-light)' : 'transparent',
                  color: focusedIndex === index ? 'var(--primary-hover)' : 'var(--text-main)',
                  borderBottom: index === filteredProvinces.length - 1 ? 'none' : '1px solid var(--secondary-light)',
                  fontWeight: focusedIndex === index ? '600' : 'normal',
                }}
              >
                {prov.name}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && <div className="form-error-msg">{error}</div>}
    </div>
  );
}
