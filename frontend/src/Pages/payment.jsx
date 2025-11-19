import { AxiosWithAuth } from "../../utils/AxiosWithAuth";
import './payment.css';

export function Payment() {

    const handleFakePay = () => async (e) => {
        e.preventDefault();
        try {
            await AxiosWithAuth().post('/cart/checkout');
            window.alert("Payment Successful! Redirecting to Orders page.");
            window.location.href = '/#/orders';
        } catch (error) {
            window.alert("Payment Failed! Please try again.");
        }
    };

    return (
        <div className="paymentPage">
        <h1>Payment Page</h1>
            <form className = "paymentForm">
                <fieldset>
                    <legend>Card Details</legend>
                    <label>
                        Name on Card
                        <input type="text" name="cardName" />
                    </label>
                    <label>
                        Card Number
                        <input type="text" name="cardNumber"inputMode="numeric" />
                    </label>
                    <div className="row">
                        <label>
                            Expiry
                            <input type="text" name="expiry" placeholder="MM/YY" />
                        </label>
                        <label>
                            CVC
                            <input type="text" name="cvc" inputMode="numeric" />
                        </label>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>Billing Address</legend>
                    <label>
                        Country
                        <input type="text" name="country" placeholder="Country" />
                    </label>
                    <label>
                        City
                        <input type="text" name="city" placeholder="City" />
                    </label>
                    <label>
                        Street
                        <input type="text" name="street" placeholder="Street Address" />
                    </label>
                    <label>
                        Postal Code
                        <input type="text" name="postal" placeholder="ZIP / Postal" />
                    </label>
                </fieldset>
                <button type="submit" onClick={handleFakePay()}>Pay Now</button>
            </form>
        </div>
    );
}