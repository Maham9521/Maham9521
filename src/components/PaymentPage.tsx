import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const stripePromise = loadStripe('pk_test_51PNzhaLpwHNGapzfD9pDkaQe72OGtExFp26N9V7n61n365h31VLXwwlFZk5yEiBjiRzZ3Ze48FGRorbNKxski42Z006sUInLgq');

const CheckoutForm: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { data } = await axios.post('http://localhost:5000/api/create-payment-intent');
    const clientSecret = data.clientSecret;

    const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
            card: elements.getElement(CardElement)!,
        },
    });

    if (result.error) {
        setPaymentError(result.error.message || null);
        setPaymentSuccess(null);
    } else {
        if (result.paymentIntent?.status === 'succeeded') {
            setPaymentError(null);
            setPaymentSuccess('Payment successful!');
        }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>
        Pay $5
      </button>
      {paymentError && <div>{paymentError}</div>}
      {paymentSuccess && <div>{paymentSuccess}</div>}
    </form>
  );
};

const PaymentPage: React.FC = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default PaymentPage;
