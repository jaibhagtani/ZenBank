import { LinkBankAccountForm } from "@/components/link-account/linkAccountForm";
import { getLinkAccountDetails } from "@/lib/actions/getLinkUserDetails";

export default async function LinkAccountPage({ params }: { params: { link_auth_token: string } }) {
  const link_auth_token = (await params).link_auth_token;
  const linkUserDetails = await getLinkAccountDetails(link_auth_token);

  if (!linkUserDetails) {
    return <div className="mt-20 flex justify-center">Invalid or expired link.</div>;
  }

  return (
    <LinkBankAccountForm
      initialData={{
        name: linkUserDetails.name,
        phone: linkUserDetails.phoneNumber,
        email: linkUserDetails.email,
        userIdAccordingToWallet: linkUserDetails.userIdAccordingToWallet,
        link_auth_token: link_auth_token,
        provider: linkUserDetails.provider
      }}
    />
  );
}
