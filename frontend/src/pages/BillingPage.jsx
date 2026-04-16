import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const BillingPage = () => {
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [selectedPlan, setSelectedPlan] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      const [plansRes, subscriptionRes, historyRes] = await Promise.all([
        axios.get(`${API_URL}/billing/plans`, { withCredentials: true }),
        axios.get(`${API_URL}/billing/subscription`, { withCredentials: true }),
        axios.get(`${API_URL}/billing/history`, { withCredentials: true }),
      ]);

      setPlans(plansRes.data.allPlans);
      setCurrentSubscription(subscriptionRes.data.subscription);
      setPaymentHistory(historyRes.data.payments);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load billing information");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan) => {
    try {
      const response = await axios.post(
        `${API_URL}/billing/checkout`,
        {
          planType: plan.plan_type,
          billingInterval: plan.billing_interval,
          price: plan.price,
        },
        { withCredentials: true },
      );

      // Redirect to Stripe Checkout
      if (response.data.url) {
        window.location.href = response.data.url;
      }

    } catch (error) {
      console.log(error);
      toast.error("Failed to initiate checkout");
    }
  };

  const handleCancelSubscription = async () => {
    try {
      await axios.post(
        `${API_URL}/billing/cancel-subscription`,
        {},
        { withCredentials: true },
      );

      toast.success("Subscription cancelled successfully");
      setOpenDialog(false);
      fetchBillingData();
    } catch (error) {
      console.log(error);
      toast.error("Failed to cancel subscription");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        Billing & Subscription
      </h1>

      {/* Current Subscription */}
      {currentSubscription && (
        <Card>
          <CardContent>
            <div className="flex justify-between items-start">
              <div>
                <Typography variant="h6" gutterBottom>
                  Current Subscription
                </Typography>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Typography variant="body1" className="font-medium">
                      Plan:
                    </Typography>
                    <Chip
                      label={currentSubscription.plan?.plan_type || "Free"}
                      color={
                        currentSubscription.plan?.plan_type === "Free"
                          ? "default"
                          : "primary"
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Typography variant="body1" className="font-medium">
                      Status:
                    </Typography>
                    <Chip
                      label={currentSubscription.status}
                      color={
                        currentSubscription.status === "active"
                          ? "success"
                          : "default"
                      }
                      size="small"
                    />
                  </div>
                  {currentSubscription.current_period_end && (
                    <Typography variant="body2" color="textSecondary">
                      Expires:{" "}
                      {new Date(
                        currentSubscription.current_period_end,
                      ).toLocaleDateString()}
                    </Typography>
                  )}
                </div>
              </div>
              {currentSubscription.status === "active" && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setOpenDialog(true)}
                >
                  Cancel Subscription
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <Typography variant="h6" gutterBottom>
        Available Plans
      </Typography>
      <Grid container spacing={3}>
        {plans.map((plan) => (
          <Grid size={{ xs: 12, md: 4 }} key={plan.id}>
            <Card
              className={`h-full ${plan.plan_type === "pro" ? "border-2 border-blue-500" : ""}`}
            >
              <CardContent>
                <div className="text-center mb-4">
                  <Typography variant="h5" gutterBottom>
                    {plan.plan_type}
                  </Typography>
                  <Typography
                    variant="h4"
                    color="primary"
                    className="font-bold"
                  >
                    ${plan.price}
                    <Typography
                      component="span"
                      variant="body2"
                      color="textSecondary"
                    >
                      /{plan.billing_interval}
                    </Typography>
                  </Typography>
                </div>

                <div className="space-y-3 mt-4">
                  {plan.feature_flags?.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircleIcon
                        className="text-green-500"
                        fontSize="small"
                      />
                      <Typography variant="body2">{feature}</Typography>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <Button
                    fullWidth
                    variant={
                      plan.plan_type === "pro" ? "contained" : "outlined"
                    }
                    color="primary"
                    onClick={() => handleSubscribe(plan)}
                    disabled={
                      currentSubscription?.plan?.id === plan.id ||
                      (plan.price === 0 &&
                        currentSubscription?.plan?.plan_type === "Free")
                    }
                  >
                    {currentSubscription?.plan?.id === plan.id
                      ? "Current Plan"
                      : plan.price === 0
                        ? "Current Plan"
                        : "Subscribe"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Payment History */}
      <Card className="mt-6">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Payment History
          </Typography>

          {paymentHistory.length === 0 ? (
            <div className="text-center py-8">
              <Typography color="textSecondary">
                No payment history yet
              </Typography>
            </div>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    {/* <TableCell>Plan</TableCell> */}
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Invoice</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentHistory.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </TableCell>
                      {/* <TableCell>{payment.plan_type}</TableCell> */}
                      <TableCell>${payment.amount}</TableCell>
                      <TableCell>
                        <Chip
                          label={payment.payment_status}
                          color={
                            payment.payment_status === "paid"
                              ? "success"
                              : "default"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {payment.invoice_url && (
                          <Button
                            size="small"
                            href={payment.invoice_url}
                            target="_blank"
                          >
                            View Invoice
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Cancel Subscription Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Cancel Subscription</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel your subscription? You will lose
            access to premium features at the end of your billing period.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Keep Subscription
          </Button>
          <Button onClick={handleCancelSubscription} color="error">
            Cancel Subscription
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BillingPage;
