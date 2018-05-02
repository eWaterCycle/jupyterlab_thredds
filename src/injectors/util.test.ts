import 'isomorphic-fetch';
import { } from 'jest';

import { codeCell } from './util';

test('codeCell', () => {
    const code = '1+1';
    const result = codeCell(code);

    expect(result.value.text).toBe(code);
    expect(result.type).toBe('code');
});
