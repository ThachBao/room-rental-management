const UNITS = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
const SCALES = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];

function readThreeDigits(n, showZeroHundreds) {
  let hundreds = Math.floor(n / 100);
  let tens = Math.floor((n % 100) / 10);
  let units = n % 10;
  let res = '';

  if (hundreds > 0 || showZeroHundreds) {
    res += UNITS[hundreds] + ' trăm ';
    if (tens === 0 && units > 0) {
      res += 'lẻ ';
    }
  }

  if (tens === 1) {
    res += 'mười ';
  } else if (tens > 1) {
    res += UNITS[tens] + ' mươi ';
  }

  if (units > 0) {
    if (tens > 1 && units === 1) {
      res += 'mốt';
    } else if (tens >= 1 && units === 5) {
      res += 'lăm';
    } else {
      res += UNITS[units];
    }
  }

  return res.trim();
}

export function numberToWordsVietnamese(number) {
  if (number === 0 || !number || isNaN(number)) return 'Không đồng';
  
  let num = Math.round(Math.abs(number));
  let groups = [];

  while (num > 0) {
    groups.push(num % 1000);
    num = Math.floor(num / 1000);
  }

  let parts = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    let groupVal = groups[i];
    if (groupVal > 0) {
      let isFirstGroup = i === groups.length - 1;
      let text = readThreeDigits(groupVal, !isFirstGroup);
      if (text) {
        let scale = SCALES[i];
        parts.push(scale ? `${text} ${scale}` : text);
      }
    }
  }

  let result = parts.join(' ').trim();
  if (!result) return 'Không đồng';

  // Capitalize first letter and append 'đồng'
  result = result.charAt(0).toUpperCase() + result.slice(1) + ' đồng';
  return result.replace(/\s+/g, ' ');
}
