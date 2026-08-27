/**
 * The consent constants in `src/lib/checkout/consent.ts` carry the name of the
 * withdrawal function between asterisks, the way `/terms` carries it in an
 * `<em>`. The panel used to print those strings raw, so the buyer read literal
 * asterisks around the one phrase art. 6:230m lid 1 sub h asks to be findable.
 *
 * This renders each `*…*` span as emphasis. The strings are frozen onto the
 * order verbatim, asterisks and all — this changes only what is on screen.
 */
export function Emphasis({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*[^*]+\*)/g).map((part, i) =>
        part.length > 2 && part.startsWith("*") && part.endsWith("*") ? (
          <em key={i} className="text-ink font-medium not-italic">
            {part.slice(1, -1)}
          </em>
        ) : (
          part
        ),
      )}
    </>
  );
}
