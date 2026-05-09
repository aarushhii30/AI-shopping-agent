const axios = require("axios");

const getShopifyHeaders = () => ({
  "X-Shopify-Storefront-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
  "Content-Type": "application/json",
});

const SHOPIFY_GRAPHQL_URL = () =>
  `${process.env.SHOPIFY_STORE_URL}/api/2024-01/graphql.json`;

// Fetch all products with variants, images, prices
const fetchProducts = async (query = "", limit = 20) => {
  const gqlQuery = `
    {
      products(first: ${limit}${query ? `, query: "${query}"` : ""}) {
        edges {
          node {
            id
            title
            description
            handle
            tags
            productType
            vendor
            availableForSale
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 3) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  availableForSale
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await axios.post(
    SHOPIFY_GRAPHQL_URL(),
    { query: gqlQuery },
    { headers: getShopifyHeaders() }
  );

  if (response.data.errors) {
    throw new Error(
      "Shopify API error: " + JSON.stringify(response.data.errors)
    );
  }

  return response.data.data.products.edges.map((edge) => edge.node);
};

// Fetch products by collection
const fetchProductsByCollection = async (collectionHandle, limit = 20) => {
  const gqlQuery = `
    {
      collectionByHandle(handle: "${collectionHandle}") {
        title
        description
        products(first: ${limit}) {
          edges {
            node {
              id
              title
              description
              handle
              tags
              productType
              vendor
              availableForSale
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
                maxVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 2) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              variants(first: 5) {
                edges {
                  node {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    availableForSale
                    selectedOptions {
                      name
                      value
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await axios.post(
    SHOPIFY_GRAPHQL_URL(),
    { query: gqlQuery },
    { headers: getShopifyHeaders() }
  );

  if (response.data.errors) {
    throw new Error(
      "Shopify API error: " + JSON.stringify(response.data.errors)
    );
  }

  const collection = response.data.data.collectionByHandle;
  if (!collection) return [];
  return collection.products.edges.map((edge) => edge.node);
};

// Fetch all collections
const fetchCollections = async () => {
  const gqlQuery = `
    {
      collections(first: 20) {
        edges {
          node {
            id
            title
            handle
            description
          }
        }
      }
    }
  `;

  const response = await axios.post(
    SHOPIFY_GRAPHQL_URL(),
    { query: gqlQuery },
    { headers: getShopifyHeaders() }
  );

  if (response.data.errors) {
    throw new Error(
      "Shopify API error: " + JSON.stringify(response.data.errors)
    );
  }

  return response.data.data.collections.edges.map((edge) => edge.node);
};

// Create a cart and add items
const createCart = async (lineItems) => {
  const gqlQuery = `
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
          lines(first: 10) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    product {
                      title
                      images(first: 1) {
                        edges {
                          node {
                            url
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      lines: lineItems.map((item) => ({
        merchandiseId: item.variantId,
        quantity: item.quantity || 1,
      })),
    },
  };

  const response = await axios.post(
    SHOPIFY_GRAPHQL_URL(),
    { query: gqlQuery, variables },
    { headers: getShopifyHeaders() }
  );

  if (response.data.errors) {
    throw new Error(
      "Shopify API error: " + JSON.stringify(response.data.errors)
    );
  }

  return response.data.data.cartCreate.cart;
};

// Format products for AI context
const formatProductsForAI = (products) => {
  return products.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description?.substring(0, 300) || "",
    type: p.productType,
    vendor: p.vendor,
    tags: p.tags,
    available: p.availableForSale ?? true,
    priceMin: parseFloat(p.priceRange?.minVariantPrice?.amount || 0),
    priceMax: parseFloat(p.priceRange?.maxVariantPrice?.amount || 0),
    currency: p.priceRange?.minVariantPrice?.currencyCode || "USD",
   image:
  p.featuredImage?.url ||
  p.images?.edges?.[0]?.node?.url ||
  null,
    variants:
      p.variants?.edges?.map((v) => ({
        id: v.node.id,
        title: v.node.title,
        price: parseFloat(v.node.price?.amount || 0),
        available: v.node.availableForSale ?? true,
        options: v.node.selectedOptions,
      })) || [],
    handle: p.handle,
  }));
};

module.exports = {
  fetchProducts,
  fetchProductsByCollection,
  fetchCollections,
  createCart,
  formatProductsForAI,
};
