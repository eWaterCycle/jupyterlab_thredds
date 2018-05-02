import { } from 'jest';
import 'isomorphic-fetch';

import { codeCell } from './injector';

test('codeCell', () => {
    const code = '1+1';
    const result = codeCell(code);

    expect(result.value.text).toBe(code);
    expect(result.type).toBe('code');
});
