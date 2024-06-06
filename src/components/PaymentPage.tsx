import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import './styles/styles.css';

const stripePromise = loadStripe('pk_test_51PNzhaLpwHNGapzfD9pDkaQe72OGtExFp26N9V7n61n365h31VLXwwlFZk5yEiBjiRzZ3Ze48FGRorbNKxski42Z006sUInLgq');

const CheckoutForm: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      const { data } = await axios.post('http://localhost:5000/api/create-payment-intent', { amount: amount * 100 }); // Amount in cents
      const clientSecret = data.clientSecret;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement)!,
          billing_details: {
            name: 'Test User',
            address: {
              postal_code: '12345'
            }
          }
        },
      });

      if (result.error) {
        setPaymentError(result.error.message ?? 'An unknown error occurred');
        setPaymentSuccess(null);
        alert(result.error.message ?? 'An unknown error occurred');
      } else {
        if (result.paymentIntent?.status === 'succeeded') {
          setPaymentError(null);
          setPaymentSuccess('Payment successful!');
          alert('Payment successful!');
        }
      }
    } catch (error) {
      setPaymentError('Payment failed. Please try again.');
      alert('Payment failed. Please try again.');
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <label>
          Amount:
          <input
          className="card-element"
            type="number"
            value={amount ?? ''}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            placeholder="Enter amount"
          />
        </label>
        <label>
          Card Number:
          <CardNumberElement className="card-element" />
        </label>
        <label>
          Expiry Date:
          <CardExpiryElement className="card-element" />
        </label>
        <label>
          CVC:
          <CardCvcElement className="card-element" />
        </label>
        <button type="submit" className="submit-button" disabled={!stripe}>
          Pay
        </button>
        {paymentError && <div className="message error">{paymentError}</div>}
        {paymentSuccess && <div className="message success">{paymentSuccess}</div>}
      </form>
    </div>
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
