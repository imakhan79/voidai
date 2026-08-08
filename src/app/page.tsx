import { createClient } from "@/lib/supabase/server";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { Hero } from "@/components/marketing/Hero";
import { WhatVoidDoes } from "@/components/marketing/WhatVoidDoes";
import { DiscoveryModes } from "@/components/marketing/DiscoveryModes";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { GlobalIntelligence } from "@/components/marketing/GlobalIntelligence";
import { OpportunityIntelligence } from "@/components/marketing/OpportunityIntelligence";
import { BuildThisPipeline } from "@/components/marketing/BuildThisPipeline";
import { WhoUsesVoid } from "@/components/marketing/WhoUsesVoid";
import { FinalCta } from "@/components/marketing/FinalCta";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthenticated = Boolean(user);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingNav isAuthenticated={isAuthenticated} />
      <main className="flex-1 bg-grid">
        <Hero isAuthenticated={isAuthenticated} />
        <WhatVoidDoes />
        <DiscoveryModes />
        <HowItWorks />
        <GlobalIntelligence />
        <OpportunityIntelligence />
        <BuildThisPipeline />
        <WhoUsesVoid />
      </main>
      <FinalCta isAuthenticated={isAuthenticated} />
      <MarketingFooter />
    </div>
  );
}
