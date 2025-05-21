import { Form } from '@remix-run/react';

export default function Login() {
  return (
    <Form action="/auth/google" method="get">
      <button>Login with Google</button>
    </Form>
  );
}
