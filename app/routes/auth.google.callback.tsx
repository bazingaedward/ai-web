import { getAuthenticator } from '~/services/auth.server'

export let loader = ({ request, context }) => {
  const {authenticator} = getAuthenticator(context.cloudflare.env)
  return authenticator.authenticate('google', request, {
    successRedirect: '/',
    failureRedirect: '/login',
  })
}
