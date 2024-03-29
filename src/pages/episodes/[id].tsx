import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import api from '../../services/api';
import ConvertDurationToTimeString from '../../utils/ConvertDurationToTimeString';
import styles from '../../styles/episode.module.scss'

type Episode = {
  id: string;
  title: string;
  members: string;
  publishedAt: string;
  thumbnail: string;
  url: string;
  description: string;
  duration: number;
  durationAsString: string;
}

type EpisodeProps = {
  episode: Episode;
};

const Episode = ({episode}: EpisodeProps) => {
    return (
        <div className={styles.episode}>
            <div className={styles.thumbnailContainer}>
                <Link href="/">
                    <button type='button'>
                        <img src="/arrow-left.svg" alt="Voltar" />
                    </button>
                </Link>
                <Image
                    width={700}
                    height={160}
                    src={episode.thumbnail}
                    objectFit="cover"
                />
                <button type='button'>
                    <img src="/play.svg" alt="Tocar episódio" />
                </button>
            </div>

            <header>
                <h1>{episode.title}</h1>
                <span>{episode.members}</span>                            
                <span>{episode.publishedAt}</span>                            
                <span>{episode.durationAsString}</span>                
            </header>

            <div
                className={styles.description}
                dangerouslySetInnerHTML={{ __html: episode.description }}
            />
        </div>
    );
};

export const getStaticPaths: GetStaticPaths = async () => {
    const { data } = await api.get('/episodes', {
        params: {
            _limit: 2,
            _sort: 'publisher_at',
            _order: 'desc'
        }   
    });

  const paths = data.map((episode) => {
      return {
          params: {
              id: episode.id,
          }
      }
  })
    return {
        paths,
        fallback: 'blocking',
    }
}

export const getStaticProps: GetStaticProps = async (ctx) => {
    const { id } = ctx.params;
    const { data } = await api.get(`/episodes/${id}`);
    
    const publishedAt = format(parseISO(data.published_at), 'd MMM yy', {
      locale: ptBR
    });
    const duration = Number(data.file.duration);

    const episode = {
      id: data.id,
      title: data.title,
      members: data.members,
      publishedAt,
      thumbnail: data.thumbnail,
      description: data.description,
      url: data.file.url,
      data,
      durationAsString: ConvertDurationToTimeString(duration),
    }
    return {
        props: {
            episode,
        },
        revalidate: 60 * 60 * 24, // 24 horas
    }
}

export default Episode;