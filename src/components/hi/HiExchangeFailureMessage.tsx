import { siteContent } from "@/content/site";

export function HiExchangeFailureMessage() {
  const copy = siteContent.hi.exchangeSheet;
  return (
    <p role="alert" className="m-0 text-[15px] font-medium text-error">
      {copy.exchangeNotSavedPrefix}
      <a
        href={`mailto:${copy.exchangeNotSavedEmail}`}
        className="text-error underline decoration-1 underline-offset-2"
      >
        {copy.exchangeNotSavedEmail}
      </a>
      {copy.exchangeNotSavedSuffix}
    </p>
  );
}
