import { Resolver, Query, Args } from '@nestjs/graphql';
import { PostService } from './post.service';
import { CommentService } from './comment.service';
import { PostLoader } from './post.loader';
import { BoardDto } from './dto/board.dto';
import { PortfolioBoard } from '../schemas/portfolio-board.schema';

@Resolver((of) => BoardDto)
export class PostResolver {
  constructor(
    private readonly postService: PostService,
    private readonly commentService: CommentService,
    private readonly postLoader: PostLoader,
  ) {}

  @Query(() => [PortfolioBoard])
  async getPosts(
    @Args('ids', { type: () => [String] }) ids: string[],
  ): Promise<Post[]> {
    const posts = await this.postLoader.batchPosts.loadMany(ids);
    for (const post of posts) {
      if (post) {
        post.comments = await this.commentService.getCommentsByPostId(post.id);
        post.content = await this.postService.getPostContentById(post.id);
      }
    }
    return posts;
  }
}
