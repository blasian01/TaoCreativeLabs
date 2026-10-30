import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { ContactForm } from '../src/components/ui/ContactForm';

const originalKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
const originalFetch = global.fetch;
const originalFormData = global.FormData;
let view: ReactTestRenderer;
let calls: number;
let resets: number;

beforeEach(() => {
    delete process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
    calls = 0;
    resets = 0;
    // No DOM or service calls: model just the browser FormData boundary.
    global.FormData = class { append() {} } as unknown as typeof FormData;
    global.fetch = async () => {
        calls++;
        return { ok: true, json: async () => ({ success: true }) } as Response;
    };
    act(() => { view = create(<ContactForm />); });
});
afterEach(() => {
    act(() => view.unmount());
    global.fetch = originalFetch;
    global.FormData = originalFormData;
    if (originalKey === undefined) delete process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
    else process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY = originalKey;
});
async function submit() {
    const form = { reset() { resets++; } };
    await act(async () => {
        await view.root.findByType('form').props.onSubmit({
            preventDefault() {}, currentTarget: form, target: form,
        });
    });
}
const output = () => JSON.stringify(view.toJSON());

test('missing configuration preserves form and never claims receipt or calls service', async () => {
    await submit();
    assert.equal(calls, 0);
    assert.equal(resets, 0);
    assert.doesNotMatch(output(), /Message received/);
    assert.match(output(), /unavailable/);
    assert.equal(view.root.findByType('button').props.disabled, false);
});
test('acknowledged delivery shows receipt and resets the form', async () => {
    process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY = 'test-only';
    await submit();
    assert.equal(calls, 1);
    assert.equal(resets, 1);
    assert.match(output(), /Message received/);
});
test('provider rejection preserves message and permits retry', async () => {
    process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY = 'test-only';
    global.fetch = async () => ({ ok: true, json: async () => ({ success: false, message: 'Rejected' }) }) as Response;
    await submit();
    assert.match(output(), /Rejected/);
    assert.equal(resets, 0);
    assert.equal(view.root.findByType('button').props.disabled, false);
});
test('network failure preserves message without receipt', async () => {
    process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY = 'test-only';
    global.fetch = async () => { throw new Error('offline'); };
    await submit();
    assert.match(output(), /Something went wrong/);
    assert.doesNotMatch(output(), /Message received/);
    assert.equal(resets, 0);
});
