import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Book } from "@/lib/graphql/types"
import { IconBook, IconUser } from "@tabler/icons-react"

interface BookCardProps {
  book: Book
  onClick?: () => void
}

export function BookCard({ book, onClick }: BookCardProps) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      {book.imageUrl ? (
        <img
          src={book.imageUrl}
          alt={book.title}
          className="w-full h-48 object-cover bg-muted"
        />
      ) : (
        <div className="w-full h-48 bg-muted flex items-center justify-center">
          <IconBook className="w-16 h-16 text-muted-foreground" />
        </div>
      )}
      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
        {book.subtitle && (
          <CardDescription className="line-clamp-1">{book.subtitle}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <IconUser className="w-4 h-4" />
          <span className="line-clamp-1">{book.author.name}</span>
        </div>
        
        {book.publisher && (
          <p className="text-sm text-muted-foreground line-clamp-1">{book.publisher}</p>
        )}
        
        {book.seriesName && (
          <div className="pt-2">
            <SeriesBadge seriesName={book.seriesName} position={book.seriesPosition} />
          </div>
        )}
        
        {book.tags && (
          <div className="flex flex-wrap gap-1 pt-2">
            {book.tags.split(",").slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag.trim()}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface SeriesBadgeProps {
  seriesName: string
  position?: number | null
}

function SeriesBadge({ seriesName, position }: SeriesBadgeProps) {
  return (
    <Badge variant="outline" className="text-xs">
      {position ? `${seriesName} #${position}` : seriesName}
    </Badge>
  )
}