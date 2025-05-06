import { graphql } from "../graphql";

export const GetEmbeddedCheckoutUrlMutation = graphql(`
  mutation GetEmbeddedCheckoutUrlMutation($cartId: String!) {
    cart {
      createCartRedirectUrls(input: { cartEntityId: $cartId }) {
        redirectUrls {
          embeddedCheckoutUrl
        }
      }
    }
  }
`);