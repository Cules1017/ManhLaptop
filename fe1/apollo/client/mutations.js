import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      status
      message
      data {
        user {
          id
          name
          email
          phone
          address
          role
        }
        token
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register($name: String!, $email: String!, $password: String!, $phone: String!, $address: String!) {
    register(name: $name, email: $email, password: $password, phone: $phone, address: $address) {
      status
      message
      data {
        user {
          id
          name
          email
          phone
          address
          role
        }
        token
      }
    }
  }
`;
