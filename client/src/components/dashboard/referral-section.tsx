import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatTimeSince } from "@/lib/utils";
import { useState } from "react";

export function ReferralSection() {
  const { data: referralData, isLoading } = useQuery({
    queryKey: ['/api/user/referrals'],
  });
  
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const copyReferralLink = () => {
    if (!referralData?.referralLink) return;
    
    navigator.clipboard.writeText(referralData.referralLink)
      .then(() => {
        setCopied(true);
        toast({
          title: "Copied!",
          description: "Referral link copied to clipboard"
        });
        
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast({
          title: "Failed to copy",
          description: "Please try again or copy manually",
          variant: "destructive"
        });
      });
  };
  
  const shareViaFacebook = () => {
    if (!referralData?.referralLink) return;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralData.referralLink)}`, '_blank');
  };
  
  const shareViaTwitter = () => {
    if (!referralData?.referralLink) return;
    window.open(`https://twitter.com/intent/tweet?text=Join me on Learnyzer and learn in a fun, gamified way!&url=${encodeURIComponent(referralData.referralLink)}`, '_blank');
  };
  
  const shareViaWhatsApp = () => {
    if (!referralData?.referralLink) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(`Join me on Learnyzer and learn in a fun, gamified way! ${referralData.referralLink}`)}`, '_blank');
  };

  return (
    <div className="bg-dark-surface rounded-xl overflow-hidden border border-dark-border">
      <div className="p-6">
        <h2 className="text-xl font-bold font-gaming mb-4">Invite Friends</h2>
        
        <div className="bg-gradient-to-r from-primary-900/40 to-primary-700/40 backdrop-blur rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600/30 rounded-full flex items-center justify-center flex-shrink-0">
              <i className="ri-user-add-line text-primary-400"></i>
            </div>
            <div>
              <h3 className="font-bold text-sm">Earn 500 XP per referral</h3>
              <p className="text-xs text-gray-400 mt-1">When your friend joins Learnyzer</p>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="relative">
              {isLoading ? (
                <Skeleton className="w-full h-10 rounded-lg" />
              ) : (
                <>
                  <Input
                    type="text"
                    value={referralData?.referralLink || ""}
                    readOnly
                    className="w-full bg-dark-card border border-dark-border rounded-lg py-2 px-3 text-gray-300 text-sm focus:outline-none focus:border-primary-500"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary-400 hover:text-primary-300 transition-colors"
                    onClick={copyReferralLink}
                  >
                    {copied ? (
                      <i className="ri-check-line"></i>
                    ) : (
                      <i className="ri-file-copy-line"></i>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <div className="mt-4 flex space-x-2">
            <Button
              className="flex-1 bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-bold py-2 rounded flex items-center justify-center transition-colors"
              onClick={shareViaFacebook}
              disabled={isLoading}
            >
              <i className="ri-facebook-fill mr-1"></i>
              Share
            </Button>
            <Button
              className="flex-1 bg-[#1DA1F2] hover:bg-[#1A94DA] text-white text-xs font-bold py-2 rounded flex items-center justify-center transition-colors"
              onClick={shareViaTwitter}
              disabled={isLoading}
            >
              <i className="ri-twitter-fill mr-1"></i>
              Tweet
            </Button>
            <Button
              className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white text-xs font-bold py-2 rounded flex items-center justify-center transition-colors"
              onClick={shareViaWhatsApp}
              disabled={isLoading}
            >
              <i className="ri-whatsapp-line mr-1"></i>
              Share
            </Button>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="text-sm font-semibold mb-3">Your Referrals</div>
          
          <div className="space-y-3">
            {isLoading ? (
              Array(2).fill(0).map((_, i) => (
                <div key={i} className="flex items-center justify-between bg-dark-card p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))
            ) : referralData?.referrals && referralData.referrals.length > 0 ? (
              referralData.referrals.map((referral, idx) => (
                <div key={idx} className="flex items-center justify-between bg-dark-card p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    {referral.profileImage ? (
                      <img 
                        src={referral.profileImage} 
                        alt={referral.name} 
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-primary-600/20 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold">{referral.name.substring(0, 2).toUpperCase()}</span>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium">{referral.name}</div>
                      <div className="text-xs text-gray-400">
                        Joined {formatTimeSince(new Date(referral.joinedAt))}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs bg-primary-600/20 text-primary-400 px-2 py-0.5 rounded-full">
                    +{referral.xpEarned} XP
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-400">
                <p className="text-sm">No referrals yet</p>
                <p className="text-xs mt-1">Share your link to earn XP!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
