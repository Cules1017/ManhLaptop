const token = localStorage.getItem('token');

const handleDecrease = async (productId: number) => {
  try {
    const response = await fetch('/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ product_id: productId, quantity: -1 })
    });
    if (!response.ok) {
      throw new Error('Failed to update cart');
    }
    // Optionally fetch updated cart data here
  } catch (error) {
    console.error('Error updating cart:', error);
  }
}; 