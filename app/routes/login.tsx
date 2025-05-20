import { Form } from '@remix-run/react';

export default function Login() {
  // <Form action="/auth/google" method="get">
  //   <button>Login with Google</button>
  // </Form>
  return (
    <>
      <Form action="/auth/facebook">
        <button>Login with Facebook</button>
      </Form>
    </>
  );
}
