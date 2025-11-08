'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X } from 'lucide-react';
import type { DictionaryResponse } from '@/lib/dictionary';

interface WordDefinitionDetailProps {
  data: DictionaryResponse | { error: string };
  onClose: () => void;
}

export function WordDefinitionDetail({ data, onClose }: WordDefinitionDetailProps) {
  // Check if data is an error response
  if ('error' in data) {
    return (
      <div className="relative mt-4">
        <Card className="relative border-2 shadow-lg">
          <CardContent>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold capitalize">Word Not Found</h3>
                <p className="text-sm text-muted-foreground mt-2">{data.error}</p>
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-sm hover:bg-accent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasMultipleEntries = data.entries.length > 1;

  return (
    <div className="relative">

      <Card className="relative shadow-sm">
        <CardContent>
          {/* Header with close button */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold capitalize">{data.word}</h3>
              {data.source && (
                <a
                  href={data.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:underline"
                >
                  Source: Wiktionary
                </a>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-sm hover:bg-accent"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs for different parts of speech */}
          {hasMultipleEntries ? (
            <Tabs defaultValue="0" className="w-full">
              <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${data.entries.length}, 1fr)` }}>
                {data.entries.map((entry, idx) => (
                  <TabsTrigger key={idx} value={idx.toString()} className="capitalize">
                    {entry.partOfSpeech}
                  </TabsTrigger>
                ))}
              </TabsList>
              {data.entries.map((entry, idx) => (
                <TabsContent key={idx} value={idx.toString()}>
                  <EntryContent entry={entry} />
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div>
              <h4 className="text-lg font-semibold capitalize mb-3 text-primary">
                {data.entries[0].partOfSpeech}
              </h4>
              <EntryContent entry={data.entries[0]} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EntryContent({ entry }: { entry: DictionaryResponse['entries'][0] }) {
  return (
    <div className="space-y-6 mt-4">
      {/* Pronunciations */}
      {entry.pronunciations && entry.pronunciations.length > 0 && (
        <div>
          <h5 className="font-semibold text-sm mb-2">Pronunciation:</h5>
          <div className="flex flex-wrap gap-2">
            {entry.pronunciations.map((pron, idx) => (
              <span key={idx} className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {pron.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Word Forms */}
      {entry.forms && entry.forms.length > 0 && (
        <div>
          <h5 className="font-semibold text-sm mb-2">Forms:</h5>
          <div className="flex flex-wrap gap-2">
            {entry.forms.map((form, idx) => (
              <div key={idx} className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                <span className="font-medium">{form.word}</span>
                {form.tags && form.tags.length > 0 && (
                  <span className="text-xs ml-1 opacity-70">
                    ({form.tags.join(', ')})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Definitions (Senses) */}
      <div>
        <h5 className="font-semibold text-sm mb-2">Definitions:</h5>
        <ol className="space-y-3 list-decimal list-inside">
          {entry.senses.map((sense, idx) => (
            <li key={idx} className="text-sm">
              <span className="font-medium">{sense.definition}</span>

              {/* Examples */}
              {sense.examples && sense.examples.length > 0 && (
                <ul className="ml-4 mt-2 space-y-1">
                  {sense.examples.map((example, exIdx) => (
                    <li key={exIdx} className="text-sm text-muted-foreground italic">
                      &ldquo;{example}&rdquo;
                    </li>
                  ))}
                </ul>
              )}

              {/* Quotes */}
              {sense.quotes && sense.quotes.length > 0 && (
                <div className="ml-4 mt-2 space-y-2">
                  {sense.quotes.slice(0, 2).map((quote, qIdx) => (
                    <blockquote key={qIdx} className="text-sm text-muted-foreground border-l-2 border-muted pl-3">
                      <p className="italic">&ldquo;{quote.text}&rdquo;</p>
                      {quote.reference && (
                        <cite className="text-xs opacity-70">— {quote.reference}</cite>
                      )}
                    </blockquote>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>

      {/* Synonyms */}
      {entry.synonyms && entry.synonyms.length > 0 && (
        <div>
          <h5 className="font-semibold text-sm mb-2">Synonyms:</h5>
          <p className="text-sm text-muted-foreground">
            {entry.synonyms.slice(0, 15).join(', ')}
            {entry.synonyms.length > 15 && '...'}
          </p>
        </div>
      )}

      {/* Antonyms */}
      {entry.antonyms && entry.antonyms.length > 0 && (
        <div>
          <h5 className="font-semibold text-sm mb-2">Antonyms:</h5>
          <p className="text-sm text-muted-foreground">
            {entry.antonyms.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
