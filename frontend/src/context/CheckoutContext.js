

import React, { createContext, useContext, useState } from 'react';

const CheckoutContext = createContext(null);

export const CheckoutProvider = ({ children }) => {
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', apartment: '', city: '', state: '', zip: '', country: 'IN',
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardInfo, setCardInfo] = useState({
    number: '', name: '', expiry: '', cvv: '',
  });
  const [upiId, setUpiId]     = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);
  const [step, setStep]       = useState(1); // 1=shipping 2=payment 3=review

  return (
    <CheckoutContext.Provider value={{
      shippingInfo, setShippingInfo,
      paymentMethod, setPaymentMethod,
      cardInfo, setCardInfo,
      upiId, setUpiId,
      placedOrder, setPlacedOrder,
      step, setStep,
    }}>
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error('useCheckout must be used within CheckoutProvider');
  return ctx;
};
