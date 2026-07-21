import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_func = '''  const injectLettersInBeads = (prevBeads: BeadInstance[], word: string, style: string) => {
    const nonLetters = prevBeads.filter((b: any) => b.type !== 'letter');
    if (!word) return nonLetters;
    const letters: BeadInstance[] = word.toUpperCase().split('').map((char, i) => ({
      id: `letter-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
      itemId: 'letter-bead',
      type: 'letter' as any,
      name: `Letter ${char}`,
      size: 7,
      lengthMm: 7,
      hex: style === 'black-white' ? '#111111' : (style === 'gold-metal' ? '#f59e0b' : '#ffffff'),
      cost: 500,
      letter: char,
      letterStyle: style
    }));
    const mid = Math.floor(nonLetters.length / 2);
    return [
      ...nonLetters.slice(0, mid),
      ...letters,
      ...nonLetters.slice(mid)
    ];
  };'''

new_func = '''  const injectLettersInBeads = (prevBeads: BeadInstance[], word: string, style: string) => {
    const nonLetters = prevBeads.filter((b: any) => b.type !== 'letter');
    const oldLetters = prevBeads.filter((b: any) => b.type === 'letter');
    if (!word) return nonLetters;
    const letters: BeadInstance[] = word.toUpperCase().split('').map((char, i) => {
      const match = oldLetters[i];
      const id = (match && match.letter === char && match.letterStyle === style) 
        ? match.id 
        : `letter-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`;
      return {
        id,
        itemId: 'letter-bead',
        type: 'letter' as any,
        name: `Letter ${char}`,
        size: 7,
        lengthMm: 7,
        hex: style === 'black-white' ? '#111111' : (style === 'gold-metal' ? '#f59e0b' : '#ffffff'),
        cost: 500,
        letter: char,
        letterStyle: style
      };
    });
    const mid = Math.floor(nonLetters.length / 2);
    return [
      ...nonLetters.slice(0, mid),
      ...letters,
      ...nonLetters.slice(mid)
    ];
  };'''

content = content.replace(old_func, new_func)

with open('src/App.tsx', 'w') as f:
    f.write(content)
