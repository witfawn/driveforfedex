import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, CheckCircle2, Clock, Shield, Zap, User, ArrowRight, Package } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Nav */}
      <nav className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">DriveForFedex</span>
          </div>
          <Link href="/login">
            <Button variant="outline" size="sm">Sign In</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Badge variant="secondary" className="mb-4">Pre-Qualify Once. Work Anywhere.</Badge>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-4">
          Get Ahead of the Crowd.
          <br />
          <span className="text-primary">Pre-Qualify for FedEx Driving Jobs.</span>
        </h1>
        <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
          When you walk into a FedEx contractor with your background check passed
          and drug test cleared, you're <strong>4 days ahead</strong> of every
          other applicant. They're still waiting on paperwork — you're ready for
          a road test.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/login">
            <Button size="lg" className="w-full sm:w-auto">
              Get Started
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              How It Works
            </Button>
          </a>
        </div>
      </section>

      {/* Value Props */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10 text-slate-900">
            Why Pre-Qualify?
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>4 Days Ahead</CardTitle>
                <CardDescription>
                  Background check and drug test already done. Contractors skip
                  the wait and schedule your road test immediately.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Stand Out</CardTitle>
                <CardDescription>
                  Tell any contractor "I have a FedEx ID number and I'm ready
                  for a road test." That tells them you're serious and ready.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-2">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>Guided Process</CardTitle>
                <CardDescription>
                  We walk you through the background check and drug test step
                  by step. No guessing what comes next.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10 text-slate-900">
            How It Works
          </h2>
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Sign Up</h3>
                <p className="text-slate-600">
                  Sign up with email. Complete your profile. Takes 2 minutes.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Complete Background Check & Drug Test</h3>
                <p className="text-slate-600">
                  We send you an email invite to fill out the background check application. Once you submit, you'll get drug test instructions.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Get Matched with Contractors</h3>
                <p className="text-slate-600">
                  Once you pass both, you're qualified. We'll share your
                  information with the contractors we work with. You can also
                  reach out to contractors directly — just let them know
                  you're pre-qualified and ready for a road test.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Do */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10 text-slate-900">
            What Does a FedEx Driver Do?
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <Package className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">The Job</h3>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Deliver packages on local routes</li>
                  <li>• Routes are pre-loaded — follow your route and deliver with care</li>
                  <li>• Work independently — you're trusted to get it done</li>
                  <li>• Full-time and part-time positions available</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <User className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Requirements</h3>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• 21+ with valid driver's license</li>
                  <li>• Clean driving record</li>
                  <li>• Pass drug screen (includes marijuana/THC)</li>
                  <li>• Lift 75 lbs regularly, up to 150 lbs with hand truck</li>
                  <li>• No CDL required</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10 text-slate-900">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-1">Do I have to pay anything?</h3>
              <p className="text-slate-600 text-sm">
                No. Pre-qualifying through DriveForFedex is completely free for
                candidates. Contractors pay for the background check and drug test.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">How long does it take?</h3>
              <p className="text-slate-600 text-sm">
                The background check typically takes 2–4 days. The drug test
                results take 1–3 days after you complete the test. You can check
                your status anytime by logging in.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">What if I fail the background check?</h3>
              <p className="text-slate-600 text-sm">
                You'll be notified of the result. You can still log in and see
                your status. Depending on the nature of the issue, you may be
                able to reapply in the future.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Does this guarantee me a job?</h3>
              <p className="text-slate-600 text-sm">
                Pre-qualifying makes you stand out to contractors, but it doesn't
                guarantee employment. You'll still need to interview and pass a
                road test with a contractor. But you'll be 4 days ahead of
                candidates who haven't pre-qualified.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Which terminals are available?</h3>
              <p className="text-slate-600 text-sm">
                We're starting with Troutdale and Swan Island in the
                Portland area. More locations coming as we grow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary text-white py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to get ahead?
          </h2>
          <p className="mb-8 text-primary-foreground/90">
            Start your pre-qualification now. It takes 2 minutes to create your
            profile.
          </p>
          <Link href="/login">
            <Button size="lg" variant="secondary">
              Get Started
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-slate-500">
          <p>Drive for FedEx.com — Pre-qualification for FedEx Ground driving jobs</p>
        </div>
      </footer>
    </div>
  );
}
